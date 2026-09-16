import { NextRequest, NextResponse } from 'next/server';
import { fail } from '@/lib/participation/http';
import { csvExport } from '@/lib/participation/demo-runtime';
import { role } from '@/lib/participation/security';

export async function GET(request: NextRequest) {
  const currentRole = await role(request);
  if (!currentRole) return fail(401, 'unauthorized', 'Authentication required');
  if (!['admin', 'moderator'].includes(currentRole)) return fail(403, 'forbidden', 'Admin or moderator role required');
  return new NextResponse(csvExport(), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="participation-submissions.csv"', 'cache-control': 'no-store' } });
}
