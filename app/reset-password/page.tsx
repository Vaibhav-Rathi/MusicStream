"use client";

import { Suspense } from "react";
import ResetPassword from "./ResetPassword";

const ResetPasswordWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPassword />
  </Suspense>
);

export default ResetPasswordWithSuspense;
