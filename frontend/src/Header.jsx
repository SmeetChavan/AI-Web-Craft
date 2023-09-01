const Header = () => {
  return (
    <header>
      <nav>
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/566/566463.png?w=740&t=st=1685271601~exp=1685272201~hmac=b49397e413686ab48a7f5596a8ee90e62cd3574b2da47bb02306c0a4a71f10c7"
            alt="logo"
          />

          <span className="orange_gradient">
            AI Web Craft
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.open("https://github.com/SmeetChavan")}
        >
          GitHub
        </button>
      </nav>

      <h1 className="head_text">
        Craft Websites Utilizing <span className="orange_gradient">OpenAI</span>
      </h1>

      <h2 className="desc">
        Elevate Web Design with AI Web Craft: Instant Website Generation at Your Fingertips
      </h2>
    </header>
  );
};

export default Header;
