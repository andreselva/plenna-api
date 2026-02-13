export default interface IModuleRow {
    id: number;
    parentId: number;
    name: string;
    location: string;
    description: string;
    showInSidebar: boolean;
    group: string;
    subgroup: string;
    displayName: string;
}