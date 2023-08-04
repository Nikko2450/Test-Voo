const cartButton = document.querySelector(".nav__shopping-cart");
const cart = document.querySelector(".cart");
const cartClose = document.querySelector(".cart__close");
const contents = document.querySelector(".products");
const cartProduct = document.querySelector(".cart-products");
const url = "https://voodoo-sandbox.myshopify.com/products.json";
const totalProducts = 461;
const totalPages = Math.ceil(totalProducts / 24);
let activePage = "1";
let data = {};
let errorMessage = "";

const waitForElm = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const showPage = async (pageNumber) => {
  await handleFetch(pageNumber);
};

const handleCreatePageArray = (activeButton) => {
  const maxVisiblePages = 5;
  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  if (activeButton < maxVisiblePages) {
    return [...visiblePages.slice(0, 5), "...", totalPages];
  }

  if (activeButton > totalPages - 4) {
    return [1, "...", ...visiblePages.slice(totalPages - 5)];
  }

  return [
    1,
    "...",
    activeButton - 1,
    activeButton,
    activeButton + 1,
    "...",
    totalPages,
  ];
};

const handleCreatePages = (activeButton = 1, fistCall = false) => {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  const arr = handleCreatePageArray(activeButton);
  const list = document.createElement("ul");
  list.classList.add("pagination__list");
  pagination.appendChild(list);
  let item = "";

  arr.forEach((number) => {
    item += `
      <li class="pagination__wrapper">
        ${
          number === "..."
            ? '<p class="pagination__text">...</p>'
            : `<button class="pagination__button ${
                activeButton === number ? "is-active" : ""
              }">${number}</button>`
        }
      </li>
    `;
  });

  list.innerHTML = item;

  if (!fistCall) {
    handlePaginationButtonClick();
  }
};

const updateActiveButton = (selectedPage) => {
  const buttons = document.querySelectorAll(".pagination__button");
  buttons.forEach((button) => {
    if (button.textContent === selectedPage) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  });
};

const handlePaginationButtonClick = async () => {
  await waitForElm(".pagination__button");
  const paginationButtons = document.querySelectorAll(".pagination__button");

  paginationButtons.forEach((item) => {
    item.addEventListener("click", () => {
      if (activePage !== item.textContent) {
        activePage = item.textContent;
        handleFetch(activePage);
        updateActiveButton(activePage);
        handleCreatePages(Number(activePage));
      }
    });
  });
};

const handleCreate = () => {
  contents.innerHTML = "";
  data.products.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("card");
    const cards = ` 
    <div class="card__photo">
      <p class="card__quality">Used</p>
      ${
        item.images.length
          ? `<img class="card__img" src="${item.images[0].src}" alt="#" />`
          : ""
      }
      
    </div>
    <div class="card__info">
      <div class="card__core-info">
        <p class="card__name">${item.title}</p>
        <p class="card__price">${item.variants[0].price} KR.</p>
      </div>
      <div class="card__state">
        <p class="card__condition">Condition</p>
        <p class="card__rating">${item.variants[0].title}</p>
      </div>
    </div>
    <button class="card__button">add to cart</button>`;
    div.innerHTML = cards;
    contents.append(div);
  });
};

const handleCreateCart = (item) => {
  if (document.getElementById(item.id)) {
    const parent = document.getElementById(item.id);
    const count = parent.querySelector(".cart-product__score-number");
    count.innerText = Number(count.innerText) + 1;
    handleUpdateTotalPrice();
  } else {
    const div = document.createElement("div");
    div.classList.add("cart-product");
    div.setAttribute("id", item.id);
    const cartProducts = `
    <div class="cart-product__frame">
      ${
        item.images.length
          ? `<img class="cart-product__img" src="${item.images[0].src}" alt="#" />`
          : ""
      }
      
    </div>
    <div class="cart-product__info">
      <p class="cart-product__name">${item.title}</p>
      <p class="cart-product__price">${item.variants[0].price}</p>
      <div class="cart-product__score">
        <button class="cart-product__minus">-</button>
        <p class="cart-product__score-number">1</p>
        <button class="cart-product__plus">+</button>
      </div>
    </div>
    <button class="cart-product__delete">
      <img src="/img/icon/garbage-bin.svg" alt="trashcan" />
    </button>`;
    div.innerHTML = cartProducts;
    cartProduct.append(div);
  }
};

const hanleAddToCart = () => {
  const cardButtons = document.querySelectorAll(".card__button");

  cardButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      cartProduct.classList.remove("is-empty");
      handleCreateCart(data.products[index]);

      handleRemoveFromCart();
      handleChangeProductQuantity();
      handleUpdateTotalPrice();
    });
  });
};

const handleRemoveFromCart = async () => {
  await waitForElm(".cart-product__delete");
  const deleteButtons = document.querySelectorAll(".cart-product__delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentElement;
      parent.remove();

      if (!cartProduct.children.length) {
        cartProduct.classList.add("is-empty");
      }
      handleUpdateTotalPrice();
    });
  });
};

const handleUpdateTotalPrice = () => {
  const cartProducts = document.querySelectorAll(".cart-product");
  let total = 0;

  cartProducts.forEach((product) => {
    const priceElement = product.querySelector(".cart-product__price");
    const quantityElement = product.querySelector(
      ".cart-product__score-number"
    );

    const price = parseFloat(priceElement.innerText.replace(" KR.", ""));
    const quantity = parseInt(quantityElement.innerText);

    total += price * quantity;
  });

  const totalElement = document.querySelector(".total");
  totalElement.innerText = total.toFixed(2);
};

const handleChangeProductQuantity = async () => {
  await waitForElm(".cart-product__minus");
  const plusButtons = document.querySelectorAll(".cart-product__plus");
  const minusButtons = document.querySelectorAll(".cart-product__minus");

  plusButtons.forEach((button) => {
    button.removeEventListener("click", handlePlusClick);
    button.addEventListener("click", handlePlusClick);
  });

  minusButtons.forEach((button) => {
    button.removeEventListener("click", handleMinusClick);
    button.addEventListener("click", handleMinusClick);
  });
};

const handlePlusClick = (event) => {
  const button = event.target;
  const parent = button.closest(".cart-product");
  const count = parent.querySelector(".cart-product__score-number");
  count.innerText = Number(count.innerText) + 1;
  handleUpdateTotalPrice();
};

const handleMinusClick = (event) => {
  const button = event.target;
  const parent = button.closest(".cart-product");
  const count = parent.querySelector(".cart-product__score-number");
  const currentCount = Number(count.innerText);

  if (currentCount > 1) {
    count.innerText = currentCount - 1;
    handleUpdateTotalPrice();
  } else {
    parent.remove();
    handleUpdateTotalPrice();
  }
  if (!cartProduct.children.length) {
    cartProduct.classList.add("is-empty");
  }
};

cartButton.addEventListener("click", () => {
  if (!cart.classList.contains("active")) {
    cart.classList.add("active");
  } else {
    cart.classList.remove("active");
  }
});

cartClose.addEventListener("click", () => {
  if (cart.classList.contains("active")) {
    cart.classList.remove("active");
  }
});

const handleFetch = async (page = 1) => {
  await fetch(`${url}?limit=24&page=${page}`, {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((value) => {
      data = value;
    })
    .catch((error) => {
      errorMessage = error;
    });

  handleCreate();
  hanleAddToCart();
};

handleFetch();
handleCreatePages(1, true);
handlePaginationButtonClick();

class BlackDisclosure extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: black;
          color: white;
          padding: 1px;
          border-radius: 4px;
        }

        .hidden-info {
          display: none;
          margin-top: 10px;
          font-family: Space Grotesk;
          font-size: 15px;
          font-weight: 500;
          line-height: normal;
          color: #FCF7E6;
          width: 100%;
          text-align: center;
        }

        :host(.expanded) .hidden-info {
          display: block;
        }
      </style>

      <slot></slot>
      <div class="hidden-info">
        <slot name="hidden-info"><p>This is some hidden information that will be displayed when the disclosure is clicked!</p></slot>
      </div>
    `;

    const button = document.querySelector(".drop-down__button");
    button.addEventListener("click", this.toggleExpand.bind(this));
  }

  toggleExpand() {
    this.classList.toggle("expanded");
  }
}

customElements.define("black-disclosure", BlackDisclosure);
