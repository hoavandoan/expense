export function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
        food: "fork.knife",
        transport: "car.fill",
        shopping: "cart.fill",
        entertainment: "gamecontroller.fill",
        utilities: "bolt.fill",
        accommodation: "house.fill",
        other: "ellipsis.circle.fill",
    };
    return iconMap[category] || "doc.text.fill";
}
