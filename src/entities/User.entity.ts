import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { UserRole } from "../users/enums/user-role.enum";
import { Cat } from "./Cat.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: UserRole,
    array: true,
    default: [UserRole.User], // Default value if no roles are specified
  })
  roles: UserRole[];

  @ManyToMany(() => Cat, (cat) => cat.users)
  @JoinTable()
  favorites: Cat[];
}
