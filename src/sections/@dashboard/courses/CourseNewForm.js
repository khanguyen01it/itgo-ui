import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { camelCase } from 'change-case';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import {
	Card,
	Chip,
	Grid,
	Stack,
	TextField,
	Typography,
	Autocomplete,
	InputAdornment,
} from '@mui/material';
// routes
// components
import {
	FormProvider,
	RHFSelect,
	RHFEditor,
	RHFTextField,
	RHFUploadSingleFile,
} from '../../../components/hook-form';
import courseApi from '../../../api/courseApi';
import uploadApi from '../../../api/uploadApi';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../../routes/paths';

// ----------------------------------------------------------------------

const STATUS_OPTION = ['Default', 'Sale', 'New'];

const INSTRUCTOR_OPTION = [
	{
		_id: '621ef50a265a5b324c1dec77',
		email: 'kha.nguyen01.it@gmail.com',
	},
];

const TAGS_OPTION = [
	'JavaScript',
	'TypeScript',
	'HTML, CSS',
	'NodeJS',
	'ExpressJS',
	'Python',
	'ReactJS',
	'Front End',
	'Back End',
];

const LabelStyle = styled(Typography)(({ theme }) => ({
	...theme.typography.subtitle2,
	color: theme.palette.text.secondary,
	marginBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

CourseNewForm.propTypes = {
	isEdit: PropTypes.bool,
	currentCourse: PropTypes.object,
};

export default function CourseNewForm({ isEdit, currentCourse }) {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	const NewCourseSchema = Yup.object().shape({
		instructor: Yup.string().required('Instructor is required'),
		name: Yup.string().required('Name is required'),
		cover: Yup.mixed().required('Cover is required'),
		price: Yup.number().moreThan(0, 'Price should not be $0.00'),
		overview: Yup.string().required('Overview is required'),
		requirements: Yup.string().required('Requirements is required'),
		targetAudiences: Yup.string().required('Target Audiences is required'),
	});

	const defaultValues = useMemo(
		() => ({
			instructor: currentCourse?.instructor?._id || INSTRUCTOR_OPTION[0]._id,
			name: currentCourse?.name || '',
			cover: currentCourse?.cover || null,
			price: currentCourse?.price || 0,
			priceSale: currentCourse?.priceSale || 0,
			status: currentCourse?.status || camelCase(STATUS_OPTION[0]),
			tags: currentCourse?.tags || [TAGS_OPTION[0]],
			overview: currentCourse?.details.overview || '',
			requirements: currentCourse?.details.requirements || '',
			targetAudiences: currentCourse?.details.targetAudiences || '',
		}),
		[currentCourse]
	);

	const methods = useForm({
		resolver: yupResolver(NewCourseSchema),
		defaultValues,
	});

	const {
		reset,
		control,
		setValue,
		getValues,
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	useEffect(() => {
		if (isEdit && currentCourse) {
			reset(defaultValues);
			setValue('cover', { path: currentCourse?.cover, preview: currentCourse?.cover });
		}
		if (!isEdit) {
			reset(defaultValues);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEdit, currentCourse]);

	const onSubmit = async (data) => {
		data.cover = data.cover.path;
		if (isEdit) {
			data.id = currentCourse._id;
			try {
				const response = await courseApi.update(data);
				if (response.data.success) {
					reset();
					enqueueSnackbar('Update success!');
					navigate(PATH_DASHBOARD.courses.list);
				}
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				const response = await courseApi.add(data);
				if (response.data.success) {
					reset();
					enqueueSnackbar('Create success!');
					navigate(PATH_DASHBOARD.courses.list);
				}
			} catch (error) {
				console.error(error);
			}
		}
	};

	const handleDrop = useCallback(
		async (acceptedFiles) => {
			const file = acceptedFiles[0];

			if (file) {
				try {
					const data = new FormData();
					data.append('image', file);
					const response = await uploadApi.addCourseImage(data);

					if (!response.data.success) return;
					const path = response.data.file.path;
					const cover = { path, preview: URL.createObjectURL(file) };
					setValue('cover', cover);
				} catch (error) {
					console.error(error);
				}
			}
		},
		[setValue]
	);

	return (
		<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Card sx={{ p: 3 }}>
						<Stack spacing={3}>
							<RHFTextField name="name" label="Course Name" />

							<div>
								<LabelStyle>Overview</LabelStyle>
								<RHFEditor simple name="overview" />
							</div>
							<div>
								<LabelStyle>Requirements</LabelStyle>
								<RHFEditor simple name="requirements" />
							</div>
							<div>
								<LabelStyle>Target Audiences</LabelStyle>
								<RHFEditor simple name="targetAudiences" />
							</div>

							<div>
								<LabelStyle>Cover</LabelStyle>
								<RHFUploadSingleFile
									name="cover"
									accept="image/*"
									maxSize={3145728}
									onDrop={handleDrop}
								/>
							</div>
						</Stack>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Stack spacing={3}>
						<Card sx={{ p: 3 }}>
							<Stack spacing={3} mt={2}>
								<RHFSelect name="instructor" label="Instructor">
									{INSTRUCTOR_OPTION.map((instructor) => (
										<option key={instructor?._id} value={instructor?._id}>
											{instructor.email}
										</option>
									))}
								</RHFSelect>

								<RHFSelect name="status" label="Status">
									{STATUS_OPTION.map((status) => (
										<option key={status} value={camelCase(status)}>
											{status}
										</option>
									))}
								</RHFSelect>

								<Controller
									name="tags"
									control={control}
									render={({ field }) => (
										<Autocomplete
											{...field}
											multiple
											freeSolo
											onChange={(event, newValue) => field.onChange(newValue)}
											options={TAGS_OPTION.map((option) => option)}
											renderTags={(value, getTagProps) =>
												value.map((option, index) => (
													<Chip
														{...getTagProps({ index })}
														key={option}
														size="small"
														label={option}
													/>
												))
											}
											renderInput={(params) => <TextField label="Tags" {...params} />}
										/>
									)}
								/>
							</Stack>
						</Card>

						<Card sx={{ p: 3 }}>
							<Stack spacing={3} mb={2}>
								<RHFTextField
									name="price"
									label="Regular Price"
									placeholder="0.00"
									defaultValue={getValues('price') === 0 ? '' : getValues('price')}
									onChange={(event) => setValue('price', Number(event.target.value))}
									InputLabelProps={{ shrink: true }}
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
										type: 'number',
									}}
								/>

								<RHFTextField
									name="priceSale"
									label="Sale Price"
									placeholder="0.00"
									defaultValue={getValues('priceSale') === 0 ? '' : getValues('priceSale')}
									onChange={(event) => setValue('priceSale', Number(event.target.value))}
									InputLabelProps={{ shrink: true }}
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
										type: 'number',
									}}
								/>
							</Stack>
						</Card>

						<LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
							{!isEdit ? 'Create Course' : 'Save Changes'}
						</LoadingButton>
					</Stack>
				</Grid>
			</Grid>
		</FormProvider>
	);
}
