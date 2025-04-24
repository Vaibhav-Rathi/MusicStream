import React, { Suspense } from "react";
import ResetPassword from "./page";

const ResetPasswordWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPassword />
  </Suspense>
);

export default ResetPasswordWithSuspense;
