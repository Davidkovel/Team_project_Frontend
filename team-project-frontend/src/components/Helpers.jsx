function StatusBadge({ survey }) {
  const now = new Date();
  const start = survey.startAt ? new Date(survey.startAt) : null;
  const end   = survey.endAt   ? new Date(survey.endAt)   : null;
  if (!survey.isPublished) return <span className="badge badge-draft">Чернетка</span>;
  if (end && now > end)    return <span className="badge badge-closed">Завершено</span>;
  if (start && now < start) return <span className="badge badge-draft">Не почато</span>;
  return <span className="badge badge-active">Активне</span>;
}
 
function isSurveyVoteable(survey) {
  if (!survey.isPublished) return false;
  const now = new Date();
  if (survey.startAt && now < new Date(survey.startAt)) return false;
  if (survey.endAt   && now > new Date(survey.endAt))   return false;
  return true;
}

function isSurveyActive(s) {
  if (!s.isPublished) return false;
  const now = new Date();
  if (s.startAt && now < new Date(s.startAt)) return false;
  if (s.endAt   && now > new Date(s.endAt))   return false;
  return true;
}

function getSurveyStatus(s) {
  if (!s.isPublished) return { label: "Чернетка", cls: "draft" };
  const now = new Date();
  if (s.endAt && now > new Date(s.endAt)) return { label: "Завершене", cls: "ended" };
  if (s.startAt && now < new Date(s.startAt)) return { label: "Не почато", cls: "draft" };
  return { label: "Активне", cls: "active" };
}
 
function Spinner() { return <div className="spinner" />; }
 
function Alert({ type = "error", msg }) {
  if (!msg) return null;
  return <div className={`alert alert-${type}`}>{msg}</div>;
}

export { StatusBadge, isSurveyVoteable, getSurveyStatus, isSurveyActive, Spinner, Alert };