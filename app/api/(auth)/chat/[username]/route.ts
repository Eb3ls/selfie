import { NextRequest } from "next/server";
import { generateMessageResponse } from "@/api_utils/api_functions";

export const GET = async (
	request: NextRequest,
	{ params }: { params: { username: string } }
) => {
	console.log(params.username);

	return generateMessageResponse("Not implemented yet", 501);
};
