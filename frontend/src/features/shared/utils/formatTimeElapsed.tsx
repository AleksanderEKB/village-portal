// frontend/src/features/shared/utils/formatTimeElapsed.tsx

export const formatTimeElapsed = (createdAt: string | Date): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);

    const sameDay =
        now.getDate() === createdDate.getDate() &&
        now.getMonth() === createdDate.getMonth() &&
        now.getFullYear() === createdDate.getFullYear();

    const declension = (number: number, titles: [string, string, string]): string => {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[
            number % 100 > 4 && number % 100 < 20
                ? 2
                : cases[number % 10 < 5 ? number % 10 : 5]
        ];
    };

    if (sameDay) {
        const diff = now.getTime() - createdDate.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 60) {
            return `${minutes} ${declension(minutes, ['минута', 'минуты', 'минут'])} назад`;
        } else {
            return `${hours} ${declension(hours, ['час', 'часа', 'часов'])} назад`;
        }
    } else {
        const day = createdDate.getDate();
        const monthDeclensions = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const month = monthDeclensions[createdDate.getMonth()];
        const year = createdDate.getFullYear();
        return `${day} ${month} ${year}`;
    }
};
