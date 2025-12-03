
// Tournament endpoint is deprecated - use /api/fight for 1v1 battles instead
export async function POST() {
  return Response.json(
    {
      error: "Tournament endpoint is deprecated. Use /api/fight for 1v1 battles.",
    },
    { status: 410 }
  );
}



