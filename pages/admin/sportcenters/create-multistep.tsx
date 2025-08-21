import { MultiStepSportCenterForm } from '../../../components/forms/MultiStepSportCenterForm/MultiStepSportCenterForm';

CreateMultiStepSportCenter.getLayout = function getLayout(
  page: React.ReactElement
) {
  return page; // No layout wrapper - removes header and footer
};

export default function CreateMultiStepSportCenter() {
  return <MultiStepSportCenterForm />;
}
