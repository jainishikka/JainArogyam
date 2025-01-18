// src/components/Layout.jsx
import Header from '../components/Header';
// import Footer from '../components/Footer';


const Layout = ({ children }) => {
    return (
        <>
            <Header />
            {/* <main>{children}</main> */}
            {children}
            {/* <Footer /> */}
        </>
    );
};

export default Layout;
