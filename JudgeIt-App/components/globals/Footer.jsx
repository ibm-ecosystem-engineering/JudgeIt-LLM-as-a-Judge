function Footer() {
  return (
    <footer
      style={{
        bottom: 15,
        height: "40px",
        fontSize: 11,
        zIndex: 1,
        textAlign: "center",
      }}
    >
      <div className="container">
        <p style={{ margin: "20px" }}>
          Disclaimer - Please note that this content is made available to foster
          Embedded AI technology adoption. The content may include systems &
          methods pending patent with the USPTO and protected under US Patent
          Laws. Copyright - 2024 IBM Corporation. In case of any questions or
          support, please reach out to{" "}
          <a href="mailto: kunal@ibm.com">kunal@ibm.com</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
