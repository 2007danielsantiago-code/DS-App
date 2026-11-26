document.querySelectorAll(".password-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = document.getElementById(toggle.getAttribute("aria-controls"));
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    toggle.setAttribute("aria-pressed", String(isPassword));
    toggle.setAttribute(
      "aria-label",
      isPassword ? "Ocultar senha" : "Mostrar senha",
    );
  });
});

const signupForm = document.querySelector("#signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "onboarding-idade.html";
  });
}

const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "principal.html";
  });
}

const resetForm = document.querySelector("#reset-form");
if (resetForm) {
  resetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = resetForm.querySelector('[name="password"]');
    const confirmation = resetForm.querySelector(
      '[name="password-confirmation"]',
    );
    const status = document.querySelector(".form-status");

    if (password.value !== confirmation.value) {
      status.textContent = "As senhas não coincidem.";
      confirmation.focus();
      return;
    }

    status.textContent = "A autenticação ainda não está configurada.";
  });
}

document.querySelectorAll(".google-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".form-status").textContent =
      "A autenticação com Google ainda não está configurada.";
  });
});

const ageRange = document.querySelector("#age-range");
if (ageRange) {
  const ageValue = document.querySelector("#age-value");
  const updateAge = () => {
    const age = Number(ageRange.value);
    ageValue.textContent = `${age} ${age === 1 ? "Ano" : "Anos"}`;
    ageRange.style.setProperty(
      "--age-progress",
      `${(age / Number(ageRange.max)) * 100}%`,
    );
  };

  ageRange.addEventListener("input", updateAge);
  updateAge();
}

const ageForm = document.querySelector("#age-form");
if (ageForm) {
  ageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem("ds.age", ageRange.value);
    window.location.href = "onboarding-nome.html";
  });
}

const nicknameForm = document.querySelector("#nickname-form");
if (nicknameForm) {
  nicknameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nickname = nicknameForm.elements.nickname.value.trim();
    localStorage.setItem("ds.nickname", nickname);
    window.location.href = "onboarding-foto.html";
  });
}

const photoInput = document.querySelector("#profile-photo-input");
if (photoInput) {
  const photoPreview = document.querySelector("#profile-preview");
  const photoStatus = document.querySelector("#photo-status");

  document.querySelectorAll(".photo-picker").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.capture) {
        photoInput.setAttribute("capture", button.dataset.capture);
      } else {
        photoInput.removeAttribute("capture");
      }

      photoInput.click();
    });
  });

  photoInput.addEventListener("change", () => {
    const [file] = photoInput.files;
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      photoStatus.textContent = "Selecione um arquivo de imagem.";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        sessionStorage.setItem("ds.profilePicture", reader.result);
        photoPreview.src = reader.result;
        photoStatus.textContent = "";
      } catch (error) {
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          photoStatus.textContent =
            "Não foi possível carregar essa imagem. Tente outra foto.";
          return;
        }

        throw error;
      }
    });
    reader.addEventListener("error", () => {
      photoStatus.textContent = "Não foi possível ler essa imagem.";
    });
    reader.readAsDataURL(file);
  });
}

const profileForm = document.querySelector("#profile-form");
if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "principal.html";
  });
}

const skipProfile = document.querySelector(".skip-profile");
if (skipProfile) {
  skipProfile.addEventListener("click", () => {
    sessionStorage.removeItem("ds.profilePicture");
  });
}

const homeGreeting = document.querySelector("#home-greeting");
if (homeGreeting) {
  const nickname = localStorage.getItem("ds.nickname") || "Daniel";
  homeGreeting.textContent = `Olá ${nickname}`;

  const savedPicture = sessionStorage.getItem("ds.profilePicture");
  if (savedPicture) {
    const profileImage = document.querySelector("#home-profile-picture");
    profileImage.src = savedPicture;
    profileImage.classList.add("user-profile-picture");
  }
}
