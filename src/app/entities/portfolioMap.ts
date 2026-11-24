export interface PortfolioMap {
  services: Map<string, ServiceSnippet[]>;
}

export interface ServiceSnippet {
  id: string;
  name: string;
  parentId: string;
  tagline: string;
  image: string;
}
