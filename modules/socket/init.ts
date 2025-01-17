import type { DataType } from "@app/modules/types/mod.ts";
import { ulid } from "jsr:@std/ulid/ulid";
import { ulidToDate } from "@app/utils/ulid.ts";

const id = ulid();
const time = ulidToDate(id);

export const initialData: DataType[] = [
  {
    type: "message",
    username: "admin",
    img: "https://avatars.githubusercontent.com/in/15368?v=4",
    messages: [
      {
        msg: "Hello world!",
        time,
        id,
      },
    ],
  },
];
