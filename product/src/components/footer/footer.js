import "../../index.css";

const Footer = () => {
    return (
        <footer 
            className="footer text-center"
            style={{
                position: "relative",
                bottom: 0,
                width: "100%",
                marginTop: "auto",
                backgroundColor: "#232F3E", // Add background color for visibility
                color: "white", // Text color
                padding: "10px 0",
                textAlign: "center",
            }}
        >
            <p>© 2025 All Rights Reserved.</p>
        </footer>
    );
};

export default Footer;
