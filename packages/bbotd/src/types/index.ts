export type ButtonType = "NoButton" | "Left" | "Right";
export type State = "Pressed" | "Released" | "Move" | "Drag";

export type DataRecord = {
  timestamp: number;
  button: ButtonType;
  state: State;
  x: number;
  y: number;
  toTensorLike(): number[];
} & Pick<Object, "toString">;
