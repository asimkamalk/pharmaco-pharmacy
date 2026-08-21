import { updateCustomer } from "@/lib/actions/admin";

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface CustomerFormProps {
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
  };
}

const CustomerForm = ({ customer }: CustomerFormProps) => {
  return (
    <form action={updateCustomer} className="space-y-4">
      <input type="hidden" name="id" value={customer.id} />

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Full name</span>
        <input
          name="name"
          required
          defaultValue={customer.name ?? ""}
          className={field}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={customer.email ?? ""}
          className={field}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">
          Username{" "}
          <span className="font-normal text-lightColor">(optional)</span>
        </span>
        <input
          name="username"
          defaultValue={customer.username ?? ""}
          className={field}
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
      >
        Save customer
      </button>
    </form>
  );
};

export default CustomerForm;
