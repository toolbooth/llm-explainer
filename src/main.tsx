import { createRoot } from "react-dom/client";
import App from "./App";
import SeriesIndex from "./series/SeriesIndex";
import { useRoute } from "./series/route";
import "./styles.css";

/** `#/essays` → series index; every other URL → essay #1, untouched at the root. */
function Root() {
  return useRoute() === "index" ? <SeriesIndex /> : <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
