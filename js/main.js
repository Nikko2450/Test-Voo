const cartButton = document.querySelector(".nav__shopping-cart");
const cart = document.querySelector(".cart");
const cartClose = document.querySelector(".cart__close");
const contents = document.querySelector(".products");
const url = "https://voodoo-sandbox.myshopify.com/products.json";
const totalProducts = 461;
let data = {};
let errorMessage = "";
let page = 1;

const handleCreate = () => {
  data.products.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("card");
    const cards = ` 
    <div class="card__photo">
      <p class="card__quality">Used</p>
      ${
        item.images.length
          ? `<img class="card__img" src="${item.images[0].src}" alt="#">`
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

const hanleAddToCart = () => {
  const cardButtons = document.querySelectorAll(".card__button");
  const cartData = [];

  cardButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      cartData.push(data.products[index]);
    });
  });
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

const handleFetch = async () => {
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
