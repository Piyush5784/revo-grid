import { type IconType } from 'react-icons';
import {
	Bs123,
	BsArrowsMove, // For Relationship
	BsAward, // For Badge
	BsBracesAsterisk,
	BsCalendar,
	BsImage,
	BsLink45Deg, // For Url
	BsMenuButtonWide, // For SingleSelect
	BsPlusSquare, // For Counter
	BsSpeedometer2, // For Progress
	BsTextLeft,
	BsToggle2On,
	BsUiChecksGrid, // For MultiSelect
} from 'react-icons/bs';

import { CoyaxFieldTypes, type Template } from "~client/utils/types";

/** Map field types to icons */
export const MAP_COYAX_FIELD_TYPE_TO_ICON: Record<CoyaxFieldTypes, IconType> = {
	[CoyaxFieldTypes.Text]: BsTextLeft,
	[CoyaxFieldTypes.LongText]: BsTextLeft,
	[CoyaxFieldTypes.Url]: BsLink45Deg,
	[CoyaxFieldTypes.Image]: BsImage,
	[CoyaxFieldTypes.Number]: Bs123,
	[CoyaxFieldTypes.Float]: Bs123,
	[CoyaxFieldTypes.Date]: BsCalendar,
	[CoyaxFieldTypes.Boolean]: BsToggle2On,
	[CoyaxFieldTypes.JSON]: BsBracesAsterisk,
	[CoyaxFieldTypes.Badge]: BsAward,
	[CoyaxFieldTypes.SingleSelect]: BsMenuButtonWide,
	[CoyaxFieldTypes.MultiSelect]: BsUiChecksGrid,
	[CoyaxFieldTypes.Relationship]: BsArrowsMove,
	[CoyaxFieldTypes.Progress]: BsSpeedometer2,
	[CoyaxFieldTypes.Counter]: BsPlusSquare,
};
