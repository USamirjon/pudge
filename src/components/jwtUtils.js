export function decodeToken(token) {
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload); // декодируем base64
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        return null;
    }
}

export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = decoded.exp * 1000; // exp в JWT хранится в секундах, преобразуем в миллисекунды
    const currentDate = new Date().getTime();

    return currentDate > expirationDate;
};
