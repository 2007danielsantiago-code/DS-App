import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const googleButtons = document.querySelectorAll(".google-button");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const resetForm = document.querySelector("#reset-form");
const logoutButton = document.querySelector(".logout-action");
const deleteAccountButton = document.querySelector(".delete-account-action");
const status = document.querySelector(".form-status, .account-status");
const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => value.trim() !== "",
);
const hasAuthControls =
  googleButtons.length > 0 ||
  loginForm ||
  signupForm ||
  resetForm ||
  logoutButton ||
  deleteAccountButton;
const auth =
  hasAuthControls && hasFirebaseConfig
    ? getAuth(initializeApp(firebaseConfig))
    : null;

googleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!ensureAuthIsConfigured()) {
      return;
    }

    setGoogleButtonsDisabled(true);
    status.textContent = "Conectando com o Google...";

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      if (user.displayName) {
        localStorage.setItem("ds.nickname", user.displayName);
      }

      window.location.href = additionalInfo?.isNewUser
        ? "onboarding-idade.html"
        : "principal.html";
    } catch (error) {
      showAuthError(error);
    } finally {
      setGoogleButtonsDisabled(false);
    }
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureAuthIsConfigured()) {
      return;
    }

    await submitAuthForm(loginForm, "Verificando seus dados...", async () => {
      const email = loginForm.elements.email.value.trim();
      const password = loginForm.elements.password.value;
      const credential = await signInWithEmailAndPassword(auth, email, password);

      if (credential.user.displayName) {
        localStorage.setItem("ds.nickname", credential.user.displayName);
      }

      window.location.href = "principal.html";
    });
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureAuthIsConfigured()) {
      return;
    }

    await submitAuthForm(signupForm, "Criando sua conta...", async () => {
      const name = signupForm.elements.name.value.trim();
      const email = signupForm.elements.email.value.trim();
      const password = signupForm.elements.password.value;
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credential.user, { displayName: name });
      localStorage.setItem("ds.nickname", name);
      window.location.href = "onboarding-idade.html";
    });
  });
}

if (resetForm) {
  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureAuthIsConfigured()) {
      return;
    }

    await submitAuthForm(
      resetForm,
      "Enviando o link de redefinição...",
      async () => {
        const email = resetForm.elements.email.value.trim();
        await sendPasswordResetEmail(auth, email);
        status.textContent =
          "Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.";
      },
    );
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    if (!ensureAuthIsConfigured()) {
      return;
    }

    logoutButton.disabled = true;
    status.textContent = "Saindo da conta...";

    try {
      await signOut(auth);
      clearLocalAccountData();
      window.location.href = "login.html";
    } catch (error) {
      showAuthError(error);
      logoutButton.disabled = false;
    }
  });
}

if (deleteAccountButton) {
  deleteAccountButton.addEventListener("click", async () => {
    if (!ensureAuthIsConfigured()) {
      return;
    }

    const confirmed = window.confirm(
      "Excluir sua conta permanentemente? Esta ação não pode ser desfeita.",
    );
    if (!confirmed) {
      return;
    }

    deleteAccountButton.disabled = true;
    status.textContent = "Excluindo sua conta...";

    try {
      await auth.authStateReady();
      if (!auth.currentUser) {
        status.textContent =
          "Sua sessão expirou. Entre novamente antes de excluir a conta.";
        return;
      }

      await deleteUser(auth.currentUser);
      clearLocalAccountData();
      window.location.href = "login.html";
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        status.textContent =
          "Por segurança, entre novamente e tente excluir a conta.";
      } else {
        showAuthError(error);
      }
    } finally {
      deleteAccountButton.disabled = false;
    }
  });
}

function ensureAuthIsConfigured() {
  if (auth) {
    return true;
  }

  status.textContent =
    "Configure o Firebase em firebase-config.js para ativar a autenticação.";
  return false;
}

function clearLocalAccountData() {
  localStorage.removeItem("ds.nickname");
  localStorage.removeItem("ds.age");
  sessionStorage.removeItem("ds.profilePicture");
}

async function submitAuthForm(form, pendingMessage, action) {
  const submitButton = document.querySelector(`[form="${form.id}"]`);
  submitButton.disabled = true;
  status.textContent = pendingMessage;

  try {
    await action();
  } catch (error) {
    showAuthError(error);
  } finally {
    submitButton.disabled = false;
  }
}

function setGoogleButtonsDisabled(disabled) {
  googleButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function showAuthError(error) {
  console.error("Falha na autenticação:", error);
  status.textContent = getAuthErrorMessage(error.code);
}

function getAuthErrorMessage(errorCode) {
  const messages = {
    "auth/invalid-email": "Digite um endereço de e-mail válido.",
    "auth/missing-email": "Digite seu endereço de e-mail.",
    "auth/email-already-in-use":
      "Este e-mail já tem uma conta. Entre ou redefina sua senha.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-disabled": "Esta conta está desativada.",
    "auth/requires-recent-login":
      "Por segurança, entre novamente antes de realizar esta ação.",
    "auth/too-many-requests":
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "auth/popup-closed-by-user":
      "A janela do Google foi fechada antes da conclusão do login.",
    "auth/popup-blocked":
      "O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.",
    "auth/unauthorized-domain":
      "Este endereço ainda não está autorizado no projeto Firebase.",
    "auth/operation-not-allowed":
      "Ative este método de login em Authentication no Firebase.",
    "auth/network-request-failed":
      "Não foi possível conectar. Verifique sua internet e tente novamente.",
    "auth/api-key-not-valid":
      "A chave da configuração Firebase não foi aceita. Confira firebase-config.js.",
    "auth/invalid-action-code":
      "Este link de redefinição expirou ou já foi usado. Solicite outro.",
  };

  const message =
    messages[errorCode] ||
    "Não foi possível concluir a autenticação. Confira os dados e tente novamente.";

  return errorCode ? `${message} (código: ${errorCode})` : message;
}
