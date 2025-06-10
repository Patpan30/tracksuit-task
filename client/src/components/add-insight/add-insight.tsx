import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";
import { useState } from "react";

type AddInsightProps = ModalProps & {
  onAdd: () => void;
};

export const AddInsight = (props: AddInsightProps) => {
  const [brand, setBrand] = useState(BRANDS[0]?.id ?? 0);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!text.trim()) {
      console.error("Insight text cannot be empty");
      return;
    }
    try {
      const response = await fetch("/api/insights/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand,
          text
        }),
      });
   
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error ?? `HTTP ${response.status}`);
      }

      if (props.onClose) {
        props.onClose();
        props.onAdd();
      }
      setText("");
      setBrand(BRANDS[0]?.id ?? 0);
    } catch (error) {
      console.error("Error adding insight:", error);
    }
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form aria-label="add insight form" className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <select className={styles["field-input"]} value={brand} onChange={(e) => setBrand(Number(e.target.value))}>
            {BRANDS.map(({ id, name }) => <option value={id} key={id}>{name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
        </label>
        <Button className={styles.submit} type="submit" label="Add insight" />
      </form>
    </Modal>
  );
};
