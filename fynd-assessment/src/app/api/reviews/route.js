import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Review from '../../../../models/Review';

export const dynamic = 'force-dynamic'; 

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');
  
  let query = {};
  if (since) {
    query = { createdAt: { $gt: new Date(since) } };
  }

  const reviews = await Review.find(query).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}