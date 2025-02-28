import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const NotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/");
        },3000)

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ fontSize: '14px', color: 'rgb(82 82 82)', margin: '16px'}}>
            <h2>Page Not Found</h2>
            <p>Redirecting to homepage...</p>
        </div>
    )
}

export { NotFound };