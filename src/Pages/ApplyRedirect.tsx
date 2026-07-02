import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { checkAuth } from "../store/authSlice";
import {
  getPendingJobRedirect,
  resolveApplyFlowPath,
  setPendingJobRedirect,
} from "../utils/activeRole";
import { initTelegramMiniApp, MINI_APP_BG, storeTelegramUserFromInitData } from "../utils/telegramMiniApp";

/**
 * Legacy entry point for job-apply links (?redirect=/job-details/...).
 * Resolves auth once and navigates directly — no intermediate <Navigate> flash.
 */
const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const resolvedRef = useRef(false);

  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    initTelegramMiniApp();
  }, []);

  useEffect(() => {
    if (resolvedRef.current) return;

    const effectiveRedirect = redirectParam || getPendingJobRedirect();
    if (redirectParam) setPendingJobRedirect(redirectParam);
    storeTelegramUserFromInitData();

    let cancelled = false;
    (async () => {
      const result = await dispatch(checkAuth());
      if (cancelled || resolvedRef.current) return;

      resolvedRef.current = true;
      const authUser = checkAuth.fulfilled.match(result) ? result.payload : null;
      const dest = resolveApplyFlowPath(!!authUser, authUser, effectiveRedirect);
      navigate(dest, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [redirectParam, dispatch, navigate]);

  return <div className="min-h-screen" style={{ backgroundColor: MINI_APP_BG }} aria-hidden="true" />;
};

export default ApplyRedirect;
