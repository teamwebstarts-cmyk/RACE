import { MapPin } from 'lucide-react';

import type { BookingLocation } from '@race/types';
import { Card, CardContent, CardHeader, CardTitle } from '@race/ui';

export function LocationMap({ location }: { location: BookingLocation }) {
  const { pickup, dropoff } = location;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-lg border border-[#EEEEEE] bg-[#F4F5F7]">
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#E8F4FC] to-[#F4F5F7]">
            <div className="absolute inset-0 opacity-20">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M32 0H0V32" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex w-full max-w-md flex-col gap-4 px-6">
              <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                <div>
                  <p className="text-xs font-semibold uppercase text-[#16A34A]">Pickup</p>
                  <p className="text-sm text-[#1A1A2E]">{pickup.address}</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {dropoff ? (
                <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#DC2626]">Drop-off</p>
                    <p className="text-sm text-[#1A1A2E]">{dropoff.address}</p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
