# Configurar autenticação

O login com Google, o cadastro/login por e-mail e a redefinição de senha usam Firebase Authentication:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e registre um app Web.
2. Em **Authentication → Sign-in method**, habilite os provedores **Google** e **Email/Password**.
3. Em **Authentication → Settings → Authorized domains**, adicione o domínio usado para abrir o app. Use exatamente o host da barra de endereço (por exemplo, `localhost` ou `127.0.0.1`), sem protocolo nem porta.
4. Copie os valores `apiKey`, `authDomain`, `projectId` e `appId` da configuração do app Web para [firebase-config.js](./firebase-config.js).
5. Sirva os arquivos por um servidor local (por exemplo, a extensão Live Server do VS Code) ou publique-os em um domínio autorizado. O fluxo não funciona abrindo as páginas diretamente como `file://`.

Os valores de configuração Web do Firebase identificam o projeto e não são credenciais de administrador. Não coloque chaves privadas ou contas de serviço no navegador.

Cadastros por e-mail criam a conta no Firebase e seguem para o onboarding; logins seguem para a página principal. **Esqueceu sua senha?** envia um link de redefinição para o endereço informado.
