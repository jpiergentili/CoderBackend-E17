export const generateUserErrorInfo = user => {
    return `
    Uno o mas properties están incompletos o no son validos.
    Lista de properties obligatorios:
        - first_name: Must be a String (${user.first_name})
        - last_name: Must be a String (${user.last_name})
        - email: Must be a String (${user.email})
    `
}