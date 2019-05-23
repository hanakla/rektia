import { Entity, Column, OneToMany } from "typeorm";
import Item from "./Item";

@Entity()
export class User {
  @Column()
  displayName: string;

  @OneToMany(type => Item, item => item.user)
  items: Item[];
}
