import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    // Garantir que locale sempre seja uma string válida
    const validLocale = locale || 'pt-BR';

    return {
        messages: (await import(`./messages/${validLocale}.json`)).default,
        locale: validLocale
    };
});
