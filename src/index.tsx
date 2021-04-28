const React = require("react");
const ReactDOM = require("react-dom");
import { ReactVisualArray } from "./components/reactvisualarray";

function App() {
    return (
        <>
            <ReactVisualArray></ReactVisualArray>
        </>
    );
}

ReactDOM.render(App(), document.getElementById("root"));
