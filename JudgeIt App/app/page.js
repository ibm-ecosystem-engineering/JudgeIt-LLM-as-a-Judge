import Image from "next/image";
import styles from "./page.module.css";
import PageTitle from "@/components/globals/PageTitle";

export default function Home() {
  return (
    <div style={{ marginRight: "20px" }}>
      <PageTitle title={"LLM Judge Application"} />
    </div>
  );
}
