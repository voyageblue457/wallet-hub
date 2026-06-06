import { formatDistanceToNowStrict } from "date-fns";

export const getTimeDistance = (date) => {
  const formatedDate = formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
  });

  return formatedDate;
};
