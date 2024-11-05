/**
 * game service
 */

import axios from "axios"
import { factories, UID } from '@strapi/strapi';
import { JSDOM } from "jsdom"
import slugify from "slugify";

const gameService: UID.Service = "api::game.game"
const publisherService: UID.Service = "api::publisher.publisher"
const developerService: UID.Service = "api::developer.developer"
const categoryService: UID.Service = "api::category.category"
const platformService: UID.Service = "api::platform.platform"

async function getGameInfo(slug: string) {
  const gogSlug = slug.replace("-", "_").toLowerCase()

  const body = await axios.get(`https://www.gog.com/game/${gogSlug}`)
  const dom = new JSDOM(body.data)

  const raw_description = dom.window.document.querySelector(".description")

  const description = raw_description.innerHTML
  const short_description = raw_description.firstChild.textContent.slice(0, 160)

  const ratingElement = dom.window.document.querySelector(
    ".age-restrictions__icon use"
  )

  return {
    description,
    short_description,
    rating: ratingElement ?
      ratingElement
        .getAttribute("xlink:href")
        .replace(/_/g, "")
        .replace("#", "") :
      "BR0"
    }
}

async function getByName(name: string, entityService: UID.Service) {
  const item = await strapi.service(entityService).find({
    filters: { name }
  })

  return item.results.length > 0 ? item.results[0] : null
}

async function create(name: string, entityService: UID.Service) {
  let item = await getByName(name, entityService)

  if (!item) {
    await strapi.service(entityService).create({
      data: {
        name,
        slug: slugify(name)
      }
    })
  }
}

async function createManyToManyData(products: any[]) {
  const developersSet = new Set()
  const publishersSet = new Set()
  const categoriesSet = new Set()
  const platformsSet = new Set()

  products.map(product => {
    const { developers, publishers, genres, operatingSystems } = product

    developers?.forEach((item: string) => {
      item && developersSet.add(item)
    })

    publishers?.forEach((item: string) => {
      item && publishersSet.add(item)
    })

    operatingSystems?.forEach((item: string) => {
      item && platformsSet.add(item)
    })

    genres?.forEach(({ name }) => {
      name && categoriesSet.add(name)
    })
  })

  const createCall = (set, entityName) =>
    Array.from(set).map((name: string) => create(name, entityName))

  return Promise.all([
    ...createCall(developersSet, developerService),
    ...createCall(publishersSet, publisherService),
    ...createCall(categoriesSet, categoryService),
    ...createCall(platformsSet, platformService),
  ])
}

async function createGames(products: any[]) {
  await Promise.all(
    products.map(async (product) => {
      const item = await getByName(product.title, gameService);
      if (!item) {
        const game = await strapi.service(`${gameService}`).create({
          data: {
            name: product.title,
            slug: product.slug,
            price: product.price.finalMoney.amount,
            release_date: new Date(product.releaseDate),
            categories: await Promise.all(
              product.genres.map(({ name }) => getByName(name, categoryService))
            ),
            platforms: await Promise.all(
              product.operatingSystems.map((name: string) =>
                getByName(name, platformService)
              )
            ),
            developers: await Promise.all(
              product.developers.map((name: string) =>
                getByName(name, developerService)
              )
            ),
            publisher: await Promise.all(
              product.publishers.map((name: string) =>
                getByName(name, publisherService)
              )
            ),
            ...(await getGameInfo(product.slug)),
            publishedAt: new Date(),
          },
        });
        return game;
      }
    })
  );
}

export default factories.createCoreService('api::game.game', () => ({
  async populate() {
    const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=100&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`

    const {
      data: { products }
    } = await axios.get(gogApiUrl)

    await createManyToManyData(products)

    await createGames(products)
  }
}));
