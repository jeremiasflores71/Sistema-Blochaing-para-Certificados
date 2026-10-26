import { labels } from "../utils/format.js";
function Badge({
  state
}) {
  return <span className={'badge ' + state}><i />{labels[state] || state}</span>;
}
export { Badge };
