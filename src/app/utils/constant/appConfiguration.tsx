interface IConfigurationProps {
  appName: string;
  baseUrl: string;
  databaseResetAPI: string;
  favicon: string;
  logo: string;
  progressMessage: string;
  version: string;
  invoiceBanner: string;
}

const version = "V1.0.0";

//////////// BETA VERSION ////////////

export const appConfiguration: IConfigurationProps = {
  appName: "School Management",
    baseUrl: "https://school-server.fitinfotech.net",
    // baseUrl: "http://localhost:2000",
  databaseResetAPI: "null",
  favicon: "/devs.png",
  invoiceBanner:"/invoice-bg.jpg",
  logo: "https://img.freepik.com/premium-vector/education-school-logo-design-template_731136-92.jpg?semt=ais_hybrid&w=740",
  version,
  progressMessage:
    "Thank you for your interest! 🚀 We're currently working on implementing this feature. Stay tuned, as we'll be activating it very soon!",
};
