export default class UiCatalogDTO {
  items: UiCatalogItemDTO[] = [];
  layouts: Record<string, UiCatalogLayoutGroupDTO[]> = {};
}

export type UiCatalogLayoutGroupDTO = {
  title: string;
  items: UiCatalogItemDTO[];
};

export type UiCatalogItemDTO = {
  name: string;
  route: string;
  description: string;
  showInSidebar: boolean;
  key?: number;
  displayName?: string; 
};
