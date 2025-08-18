import { AtributesManager } from "./atributesManager.js"

export class Product{
    id: number
    name: string
    category: string
    description: string
    price: number
    visible: boolean;
    available: boolean;
    managers: AtributesManager[]
    isDisabled: boolean;
}