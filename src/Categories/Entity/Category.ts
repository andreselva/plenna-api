import CategoryDTO from "../CategoryDTO";

export default class Category {
    name: string;
    description: string;
    type: string;
    color: string;
    id?: number;

    constructor(name: string, description: string, type: string, color: string, id?: number) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.color = color;
        this.id = id;
    }

    
    getName(): string {
        return this.name;
    }
    
    getDescription(): string {
        return this.description;
    }
    
    getType(): string {
        return this.type;
    }
    
    getColor(): string {
        return this.color;
    }
    
    getId() {
        return this.id;
    }

    static fromDTO(dto: CategoryDTO): Category {
        return new Category(
            dto.name, 
            dto.description, 
            dto.type, 
            dto.color,
            dto.id
        );
    }
}