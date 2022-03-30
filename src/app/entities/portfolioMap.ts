export class PortfolioMap {
  services: Map<string, ServiceSnippet[]>;
}

export class ServiceSnippet {
  id: string;
  name: string;
  parentId: string;
  tagline: string;
  image: string;
}
