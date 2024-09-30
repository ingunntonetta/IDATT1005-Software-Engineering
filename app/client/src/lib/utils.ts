import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Util for merging classname
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

class Utils {
  /*
      Regex that tries to match a valid email address
      Sourced from: https://emailregex.com/index.html
  */
  emailRegex: RegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  /*
      Regex that matches usernames that:
          - start with a letter
          - are between 2 and 24 characters long (inclusive)
          - can contain letters, numbers, dots, underscores and dashes
  */
  usernameRegex: RegExp = new RegExp(/^[a-zA-Z][a-zA-Z0-9._-]{1,23}$/);

  /*
      Regex that matches passwords that:
          - are at least 8 characters long
          - contain at least one lowercase letter
          - contain at least one uppercase letter
          - contain at least one number
          - contain at least one special character
  */
  passwordRegex: RegExp = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);

  /*
        Regex that matches item names that:
            - are between 1 and 32 characters long (inclusive)
            - can contain letters and spaces
    */
  itemNameRegex: RegExp = new RegExp(/^[a-zA-Z ]{1,32}$/);
}

export default new Utils();