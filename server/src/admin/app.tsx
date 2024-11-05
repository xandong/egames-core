import type { StrapiApp } from '@strapi/strapi/admin';
import Icon from "./extensions/icon.png";
import Logo from "./extensions/logo.svg";

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
    auth: {
      logo: Logo,
    },
    head: {
      favicon: Icon,
    },
    translations: {
      en: {
        "Auth.form.welcome.title": "Welcome to Won Games!",
        "Auth.form.welcome.subtitle": "Log in to your account",
        "app.components.LeftMenu.navbrand.title": "Won Games Dashboard",
      },
    },
    menu: {
      logo: Icon,
    },
    theme: {
      light: {},
      dark: {
        colors: {
          buttonPrimary500: '#34AEF4',
          buttonPrimary600: '#1E7BB1',
          primary100: "#030415",
          // primary500: "#247AAA",
          primary500: "#1E7BB1",
          primary600: "#34AEF4",
          primary700: "#34AEF4",
          neutral0: "#0d102f",
          neutral100: "#030415",
        },
      },
    },
    tutorials: false,
    notifications: {
      releases: false
    }
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
