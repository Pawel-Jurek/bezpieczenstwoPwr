import { SyntheticEvent, useRef } from "react";
import "./form.css";

export function Form() {
  const formRef = useRef<HTMLFormElement>(null!);

  function onSubmit(e: SyntheticEvent) {
    e.preventDefault();
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <small>This is example form, it does nothing.</small>
      <form onSubmit={onSubmit} ref={formRef}>
        <fieldset>
          <label htmlFor="firstname">Firstname</label>
          <input
            id="firstname"
            placeholder="e.g. Mark"
            minLength={1}
            required
          ></input>
        </fieldset>

        <fieldset>
          <label htmlFor="lastname">Lastname</label>
          <input
            id="lastname"
            placeholder="e.g. Scout"
            minLength={1}
            required
          ></input>
        </fieldset>

        <fieldset>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            placeholder="mark.scout@example.com"
            type="email"
            required
          ></input>
        </fieldset>

        <button type="submit">Sign Up</button>
      </form>
      <p className="or-divider">Or</p>
      <div className="or-button-group">
        <button title="Fake google login button, does nothing.">Google</button>
        <button title="Fake facebook login button, does nothing.">
          Facebook
        </button>
      </div>
    </div>
  );
}
