import { getPercent } from 'dddrawings';

const options = {
  pageWidth: 1360,
  pageHeight: 2070,
  pageMarginTop: 112,
  pageMarginBottom: 40,
  secondsPerPage: 160,
  fps: 24,
  percent: {},
};
const innerPageHeight = options.pageHeight - options.pageMarginTop - options.pageMarginBottom;
options.percent.h = getPercent(innerPageHeight, options.pageHeight);
options.percent.top = getPercent(options.pageMarginTop, options.pageHeight);
options.percent.bottom = getPercent(options.pageMarginBottom, options.pageHeight);

export default options;
