import { resetCustomerPassword } from "@/lib/actions/admin";

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface ResetCustomerPasswordFormProps {
  customerId: string;
  customerName: string;
}

const ResetCustomerPasswordForm = ({
  customerId,
  customerName,
}: ResetCustomerPasswordFormProps) => {
  return (
    <form action={resetCustomerPassword} className="space-y-4">
      <input type="hidden" name="id" value={customerId} />

      <p className="text-sm text-lightColor">
        Set a new password for {customerName}. Share it with them securely —
        they can sign in with it right away.
      </p>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={field}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">
          Confirm password
        </span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={field}
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
      >
        Reset password
      </button>
    </form>
  );
};

export default ResetCustomerPasswordForm;
