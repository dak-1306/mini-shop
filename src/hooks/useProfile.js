import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/users";
import { useAuthStore } from "@/store/authStore";

export default function useProfile(idProp) {
  const storeUser = useAuthStore((s) => s.user);
  const id = idProp ?? storeUser?.id;

  return useQuery({
    queryKey: ["user", id],
    queryFn: ({ signal }) => getUser(id, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
