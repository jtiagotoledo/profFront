export const validarEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validarSenhaForte = (senha:string) => {
    if (senha.length < 8) {
        return "A senha deve ter pelo menos 8 caracteres.";
    }
    /* if (!/[A-Z]/.test(senha)) {
        return "A senha deve conter pelo menos uma letra maiúscula.";
    } */
    if (!/[a-z]/.test(senha)) {
        return "A senha deve conter pelo menos uma letra minúscula.";
    }
    if (!/[0-9]/.test(senha)) {
        return "A senha deve conter pelo menos um número.";
    }
    /* if (!/[^A-Za-z0-9]/.test(senha)) {
        return "A senha deve conter pelo menos um caractere especial (ex: !, @, #, $).";
    } */
    return null;
};