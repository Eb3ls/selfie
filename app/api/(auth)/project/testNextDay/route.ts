import { handleOverdues } from "@/utils/api/api";

export const GET = async () => {
	return handleOverdues();
};
