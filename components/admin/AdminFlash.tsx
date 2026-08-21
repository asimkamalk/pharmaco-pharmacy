interface AdminFlashProps {
  saved?: string;
  error?: string;
  savedMessage?: string;
}

const AdminFlash = ({
  saved,
  error,
  savedMessage = "Saved successfully.",
}: AdminFlashProps) => {
  if (!saved && !error) return null;

  return (
    <div className="space-y-2">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="rounded-lg border border-shop_light_green/30 bg-shop_light_green/10 px-4 py-2.5 text-sm text-shop_dark_green">
          {savedMessage}
        </p>
      )}
    </div>
  );
};

export default AdminFlash;
